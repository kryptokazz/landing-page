
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('data-entry-form');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Clear previous error messages
        document.querySelectorAll('[id$="-error"]').forEach(el => el.textContent = '');

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const url = 'http://localhost:3000/api/submit-form';

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                if (response.status === 400) {
                    // Handle validation errors
                    result.errors.forEach(error => {
                        const errorElement = document.getElementById(`${error.param}-error`);
                        if (errorElement) {
                            errorElement.textContent = error.msg;
                        }
                    });
                } else {
                    throw new Error(`Server responded with a ${response.status} status.`);
                }
            } else {
                console.log('Success:', result);
                alert('Form submitted successfully!');
                form.reset();
            }
        } catch (error) {
            console.error('Error submitting form:', error.message);
            alert('An error occurred during submission. Please try again.');
        }
    });
});

