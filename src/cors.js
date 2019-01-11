const cors = (req, res, next) => {
    res.setHeader(`Access-Control-Allow-Origin`, `*`);

    res.setHeader(
        `Access-Control-Allow-Methods`,
        `GET, POST, OPTIONS, PUT, PATCH, DELETE`
    );

    res.setHeader(
        `Access-Control-Allow-Headers`,
        `Origin,X-Requested-With,content-type`
    );

    next();
}

export default cors;