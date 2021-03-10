$(document).ready(function(){
    var md = new Remarkable();

    $('#update-lesson').click(function(){
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
            $('#lesson-container').html(md.render(this.responseText));
            }
        };
    xhttp.open("GET", "lesson_example.md", true);
    xhttp.send();
    });
});