document.addEventListener("DOMContentLoaded", () => {

    console.log("JS LOADED");

    const form = document.getElementById("registerForm");
    const message = document.getElementById("message");

    if (!form) {
        console.error("FORM NOT FOUND");
        return;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault(); // ← ЭТО ДОЛЖНО СРАБОТАТЬ

        console.log("SUBMIT STOPPED");

        const payload = {
            full_name: document.getElementById("full_name").value,
            email: document.getElementById("email").value,
            password: document.getElementById("password").value,
            external_id: document.getElementById("external_id").value || null,
            alliance: document.getElementById("alliance").value,
            category: document.getElementById("category").value,
            role: document.getElementById("role").value
        };

        console.log(payload);

        try {
            const response = await fetch("http://127.0.0.1:8000/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            console.log(response);
            console.log(data);

            if (!response.ok) {
                throw new Error(data.detail || "Ошибка регистрации");
            }
            
            localStorage.setItem("token", data.access_token);

            message.textContent = "Регистрация успешна!";
            message.className = "message success";

            window.location.href = "/Register/index.html";

        } catch (err) {
            console.error(err);
            message.textContent = err.message;
            message.className = "message error";
        }
    });

});

document.getElementById("gosend").addEventListener('click',() => {
    setTimeout(() => {
            window.location.href = "../Register/index.html";
        }, 1000);
})
