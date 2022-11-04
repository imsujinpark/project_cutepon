Bun.serve({
    fetch(req) {
      return new Response("Hello!!!");
    },
    /**
     * File path to a TLS key
     *
     * To enable TLS, this option is required.
     */
    keyFile: "./key.pem",
    /**
     * File path to a TLS certificate
     *
     * To enable TLS, this option is required.
     */
    certFile: "./cert.pem",
  
    /**
     * Optional SSL options
     */
    // passphrase?: string;
    // caFile?: string;
    // dhParamsFile?: string;
    // lowMemoryMode?: boolean;
});
  