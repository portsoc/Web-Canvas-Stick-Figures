module.exports = {
    expressStatic: {
        maxAge: 5*60*1000, /* fiveMinutes */
        extensions: [ "html" ]
    },
    bodyParser_JSON: {
        limit: 4096
    },
    port: process.env.PORT || 8080,
    canvasHeight: 500,
    canvasWidth: 700,
    diamondColors: [ "#f00", "#0f0", "#08f"]
}
