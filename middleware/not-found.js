const notFound = (req, res) => {
    console.log("Request url =>",req.url);
    res.status(404).send('Route does not exist')
}

module.exports = notFound
