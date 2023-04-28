// @ts-ignore
const proxy = require("http-proxy-middleware");

module.exports = function (app:any){
    app.use(
        proxy("auth/me ",{
            target:"https://social-network.samuraijs.com",
            secure:false,
            changeOrigin:true
        })
    )
}