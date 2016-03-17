fetch('http://localhost:8080')
    .then(res => res.text())
    .then(body => document.getElementById('time').innerHTML = body);
