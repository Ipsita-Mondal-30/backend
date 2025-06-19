class ApiErrorHandle extends Error{
    constructor(statusCode, 
        message="Something went wrong, please try again later.",
        error=[],
        statck="",

    ) {
        super(message);
        this.statusCode = statusCode;
        this.data=null;
        this.error = error;
        this.statck = statck;
        this.success=false;
    }

}

export default ApiErrorHandle;