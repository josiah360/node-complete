exports.error = (req, res, next) => {
    res.status(404).render('404', {
        pageTitle: 'Page not found', 
        activeLink: '400'
    })
}

exports.get500 = (req, res) => {
    res.status(500).render('500', {
        pageTitle: 'Error!',
        activeLink: '/500',
        isAuthenticated: req.session.isLoggedIn
    })
}