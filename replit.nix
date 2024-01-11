{ pkgs }: {
  deps = [
      pkgs.unzip
      pkgs.bun
      pkgs.nodePackages.svelte-language-server
      
  ];

   # env = {
 #       PROTOCOL_HEADER = "x-forwarded-proto";
   #     HOST_HEADER = "x-forwarded-host";
  #  };
}