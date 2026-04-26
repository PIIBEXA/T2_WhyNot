const form = document.getElementById("registerForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const res = await fetch("http://127.0.0.1:8000/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                username: email,
                password: password
            })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.detail || "Неверный email или пароль");
        }

        localStorage.setItem("token", data.access_token);

        message.textContent = "Вход успешен!";
        message.className = "message success";

        setTimeout(() => {
            window.location.href = "../Календарь/calendar.html";
        }, 1000);

    } catch (err) {
        message.textContent = err.message;
        message.className = "message error";
    }
});

document.getElementById("gosend").addEventListener('click',() => {
    setTimeout(() => {
            window.location.href = "../Вход/index_register.html";
        }, 1000);
})
