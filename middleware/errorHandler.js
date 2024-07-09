
const errorHandler = (err, req, res, next) => {
    const statusCode = res.status ? res.statusCode : 500;
    switch (statusCode) {
        case 422:
            res.json({errors: {
                field: 'VALIDATION ERROR',
                message: err.message
            }})
            break;
        case 404:
            res.json({errors: {
                field: 'NOT FOUND',
                message: err.message
            }})
            break;    
        default:
            console.log('No errors found');
            break;
    }
};

module.exports = errorHandler;