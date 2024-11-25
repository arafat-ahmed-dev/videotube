class ApiResponse {
  constructor(stausCode, data, message = "Success") {
    this.data = data;
    this.message = message;
    this.stausCode = stausCode;
    this.success = stausCode < 400;
  }
}
