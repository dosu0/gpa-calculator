/*
  This file conforms to the standardJS style (https://standardjs.com/)
  This file is licensed under the GNU GPLv3 license (https://www.gnu.org/licenses/gpl-3.0.en.html)
*/

import { fetch } from "undici";
import { CookieAgent } from "http-cookie-agent/undici";
import { CookieJar } from "tough-cookie";
import EventEmitter from "node:events"; // emit 'ready' event
import type District from "$lib/District";

interface Metadata {
    version: string;
    github: string;
}

const meta: Metadata = {
    version: "0.0.1",
    github: "plat-phoenix/infinite-campus",
};

/*
  Heres some basic vocab used to keep things consistent throughout naming and comments
  term: a way of dividing up the school year. This may be by quarters, trimesters, semesters, etc.
  course: a class
  placement: the time within a day/term that a course takes place. Ex: 2nd hour at 9:15AM during quarter 1
  notification count: the number of unseen notifications. This is the number that shows next to the bell icon on the website. The count is reset when you click the bell. NOTE: unseen is different from unread
  (un)read notification: individual read state of a single notification. NOTE: read state is different from the unseen count
*/

// class definitions:
//

export interface Grades {
    percent: number;
    pointsEarned: number;
    score: string;
    totalPoints: number;
}

export interface Placement {
    startTime: string;
    endTime: string;
    periodName: string;
}

/**
 * @example
 * {
 *  "name": "2 English II",
 *  "courseNumber": "000703",
 *  "teacher": "John Doe",
 *  "roomName": "205B",
 *  "_id": "6278079",
 *  "grades": {
 *    "score": "A-",
 *    "percent": 89.76,
 *    "totalPoints": 227,
 *    "pointsEarned": 207
 *  },
 *  "placement": {
 *    "periodName": "6",
 *    "periodSeq": 7,
 *    "startTime": "14:00:00",
 *    "endTime": "15:00:00"
 *  }
 * }
 *
 */
export interface Course {
    name: string;
    courseNumber: string;
    roomName: string;
    teacher: string;
    _id: string;
    grades?: Grades;
    placement?: Placement;
    comments: string;
}

/**
 * @classdesc Represents a term. A term is a way of dividing up the school year. They may be organized as quarters, semesters, trimesters, etc.
 * A term will have a start and end date, and will contain courses.
 */
export interface Term {
    startDate: string;
    endDate: string;
    name: string;
    /**
     * Term sequence. Use this number if you want to sort terms.
     * For example, in a school that uses quarters the first quarter would be `seq: 1` while the second quarter would be: `seq: 2`
     */
    seq: number;
    courses: Course[];
}

/**
 * Class representing an authenticated Infinite Campus user
 */
class User extends EventEmitter {
    meta: any;
    authenticated: boolean;
    cookieAgent: CookieAgent;
    headers: Headers;
    district?: District;
    hasErrorListener: boolean;

    constructor() {
        super(); // calls EventEmitter constructor
        this.meta = meta;
        this.authenticated = false;
        const jar = new CookieJar();
        this.cookieAgent = new CookieAgent({ cookies: { jar } });

        this.headers = new Headers({
            "user-agent": `GitHub ${meta.github} - v${meta.version}`,
            accept: "application/json",
        });

        // detect login errors thrown
        // if there is a listener on 'error' event, emit it, else throw the error and kill the process
        this.on("error", (err) => {
            if (!this.hasErrorListener) {
                throw err;
            }
        });

        // check to see if anybody is listening on 'error'
        this.hasErrorListener = false;
        this.once("newListener", (event) => {
            if (event === "error") {
                this.hasErrorListener = true;
            }
        });
    }

    async login(districtName: string, state: string, username: string, password: string) {
        console.info("INFO: logging in...");
        try {
            // request district info & log in
            console.info("INFO: fetching district info...");
            await this._getDistrict(districtName, state);
            // weird return promise to avoid minor callback hell
            console.info("INFO: sending log in details...");
            await this._login(username, password);
            // once we are logged in
            this.authenticated = true;
            this.emit("ready", this);
        } catch (err) {
            let message = "Unknown error during the getDistrict/login process.";
            message += `If you keep getting this error please submit an issue on GitHub @${meta.github}\n`;
            // this error should never actually get thrown
            // if it does, it means either 1.) the API has changed and we cant parse it 2.) there is some unexpected value and it broke with my code
            throw Error(message + err);
        }
    }

    async fetch(url: string, options = {}) {
        return fetch(url, {
            headers: this.headers,
            dispatcher: this.cookieAgent,
            ...options,
        });
    }
    /**
     * requestes information about a school district thats needed to make requests
     * this data is stored in the this.district object
     * @param {string} districtName - the name of the district the user belongs to (ex: 'New York School Districts', 'New York')
     * @param {string} state - two letter state code (ex: 'NY', 'MN')
     * @async
     * @private
     */
    async _getDistrict(districtName: string, state: string) {
        const url =
            "https://mobile.infinitecampus.com/api/district/searchDistrict?query=" +
            districtName +
            "&state=" +
            state;
        try {
            const res = await this.fetch(url);
            // district.handle(err, res, body);
            switch (res.status) {
                case 200:
                    const json = (await res.json()) as any;
                    this.district = json.data[0];
                    break;
                case 404:
                    throw new Error(`${districtName} not found`);
                default:
                    throw new Error(`(${res.status})\n ${await res.text()}`);
            }
        } catch (err) {
            return this.emit("error", err);
        }
    }

    /**
     * logs a user in
     * cookies get stored as a requestJS cookie jar in this.cookies
     * @param {string} username - a user's username
     * @param {string} password - a user's password
     * @async
     * @private
     */
    async _login(username: string, password: string) {
        if (this.district === undefined) {
            throw Error("._getDistrict() must be ran before you can log in.");
        }
        const url =
            this.district.district_baseurl +
            "verify.jsp?nonBrowser=true&username=" +
            username +
            "&password=" +
            password +
            "&appName=" +
            this.district.district_app_name;
        try {
            const res = await this.fetch(url);
            if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);

            console.info("INFO: Login successful");

            // login.handle(err, res, body);
        } catch (err) {
            return this.emit("error", err);
        }
    }

    /**
     * requestes data for all courses a user is enrolled in. This method returns information about all terms, all courses, all grades for those courses,
     * as well as all time placement data for those courses. See documentation for the [Term]{@link Term} and [Course]{@link Course} types for more information on what this method specifically returns. <br>
     * @async
     * @returns {Term[]} array of terms containing courses
     * @example
     * const InfiniteCampus = require('infinite-campus')
     * const user = new InfiniteCampus('New York District', 'NY', 'JDoe12', 'XXXXXX')
     *
     * // wait until we are done logging in
     * user.on('ready', () => {
     *   // now that we are logged in, request courses
     *   user.getCourses().then((courses) => {
     *     console.log(courses)
     *   })
     * })
     *
     */
    async getCourses(schoolID: number | undefined): Promise<Term[]> {
        this.checkAuth();
        // request roster with placements
        let res = await this.fetch(
            this.district!.district_baseurl +
                "resources/portal/roster?_expand=%7BsectionPlacements-%7Bterm%7D%7D",
        );

        let roster = (await res.json()) as any;

        // request grades
        res = await this.fetch(this.district!.district_baseurl + "resources/portal/grades");
        let grades = (await res.json()) as any;
        console.info(grades);

        let result: any[] = []; // object that we return later
        let crossReference: any = {};

        let schoolIndex = 0;

        // if we are enrolled in multiple schools
        if (grades.length > 1) {
            // build list of schools
            let schools: any[] = [];
            grades.forEach((school: any) => {
                schools.push({
                    schoolName: school.displayName,
                    id: school.schoolID,
                    numberOfTerms: school.terms.length,
                    totalNumberOfCourses: school.courses.length,
                });
            });

            // throw warning is schoolID isn't specifed
            if (schoolID === undefined) {
                let message = `WARNING: You are enrolled in ${grades.length} schools, please explicitly specify a school ID to request courses from.`;
                message += "Please see the below output to see which schoolID to use.";
                message += `(Defaulting to the first school returned by I.C. API - name: '${schools[0].schoolName}' - id: ${schools[0].id})`;
                console.warn(message, schools);
                // default to first in array
                schoolIndex = 0;
            } else {
                // find index from schoolID
                grades.forEach((school: any, i: number) => {
                    if (school.schoolID == schoolID) {
                        schoolIndex = i;
                    }
                });
                if (schoolIndex === undefined) {
                    throw new Error(
                        `Supplied schoolID in getCourses() does not exist, please select from the following list \n\n ${JSON.stringify(
                            schools,
                        )}\n\n`,
                    );
                }
            }
        }

        // loop over terms from /grades
        grades[schoolIndex].terms.forEach((term: any, i: number) => {
            let termResult: Term = {
                name: term.termName,
                seq: term.termSeq,
                startDate: term.startDate,
                endDate: term.endDate,
                courses: [],
            };

            // loop over classes in a term
            term.courses.forEach((course: any, ii: number) => {
                let grade = course.gradingTasks[0];

                let courseResult: Course = {
                    name: course.courseName,
                    courseNumber: course.courseNumber,
                    roomName: course.roomName,
                    teacher: course.teacherDisplay,
                    // seq: null, // set this to null so we can add placement data later
                    grades: {
                        score:
                            grade.progressScore !== undefined ? grade.progressScore : grade.score,
                        percent:
                            grade.progressPercent !== undefined
                                ? grade.progressPercent
                                : grade.percent,
                        totalPoints:
                            grade.progressTotalPoints !== undefined
                                ? grade.progressTotalPoints
                                : grade.totalPoints,
                        pointsEarned:
                            grade.progressPointsEarned !== undefined
                                ? grade.progressPointsEarned
                                : grade.pointsEarned,
                    },
                    comments: grade.comments,
                    _id: course._id,
                };

                // remove grades for courses without grades
                if (
                    !(grade.progressScore || grade.score) &&
                    !(grade.progressPercent || grade.percent) &&
                    !(grade.progressTotalPoints || grade.totalPoints) &&
                    !(grade.progressPointsEarned || grade.pointsEarned)
                )
                    courseResult.grades = undefined;

                // push class to term array
                termResult.courses.push(courseResult);

                // setup cross reference with a pointer into the result var
                // we can cross reference the data from both endpoints by using the class ID later
                crossReference[course._id] = {
                    i: i,
                    ii: ii,
                };
            });

            // push terms to final array
            result.push(termResult);
        });

        /*
            At this point we have basic info about terms and a bit data on the classes (name, teacher, grade). 
            But we don't have any placement data (period, start & end time, sequence data) for courses or for terms.
            So now we look over the data from the /roster endpoint and use our cross reference object to add the missing data. 
            We loop over the data (an array of courses) and check the class ID with our cross reference.
            That gives us a pointer into the result array so we can add the data in. 
            We add class placement data into courses and check to see if we need to add term data (this is because the term object is included in every course)
          */

        // loop over classes from /roster
        roster.forEach((course: any, i: number) => {
            let placement = course.sectionPlacements[0];

            // find course from cross reference
            let ref = crossReference[roster[i]._id];
            if (!ref) return;
            let target = result[ref.i].courses[ref.ii];

            // add placement data
            target.placement = {
                periodName: placement.periodName,
                periodSeq: placement.periodSequence,
                startTime: placement.startTime,
                endTime: placement.endTime,
            };

            // // if the term doesn't have placement data associated with it
            // if (result[ref.i].seq == null) {
            //   console.log('AAA')
            //   let term = result[ref.i]
            //   term.seq = placement.term.seq
            //   term.startDate = placement.term.startDate
            //   term.endDate = placement.term.endDate
            // }
        });

        return result;
    }

    /**
     * helper function to make sure a user is authenticated before making API calls
     * @private
     */
    checkAuth() {
        // checks if the user has been authenticated
        if (!this.authenticated || this.district === undefined) {
            let message =
                "User isn't authenticated yet. Please use the .on('ready') event emitted by the User class.";
            message += `For help please see the example code on GitHub: https://github.com/${meta.github}`;
            throw Error(message);
        }
    }
}

export default User;
