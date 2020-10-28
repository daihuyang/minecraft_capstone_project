export function getDateTimeString() {
    var date = new Date();
    var hour = date.getHours();
    var min = date.getMinutes();
    var sec = date.getSeconds();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    return year + "-" + (month < 10 ? "0" : "") + month + "-" + (day < 10 ? "0" : "") + day + "--" + (hour < 10 ? "0" : "") + hour + "-" + (min < 10 ? "0" : "") + min + "-" + (sec < 10 ? "0" : "") + sec;

}