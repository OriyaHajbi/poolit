module.exports = (req, res) => {

    console.log(req.session);
    if (!req.session.isLoggedIn) {
        console.log("in isAuth");
        return res.json('doesnt logged yet')
    }
};