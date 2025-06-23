class ApiResponse{
    constructor(statuscode,message="Success",data){
        this.statusCode = statuscode;
        this.message = message;
        this.data = data || null;
        this.success = statuscode<400;
    }
}

export {ApiResponse};