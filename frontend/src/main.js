document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('data-entry-form');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Get the form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        const url = 'http://localhost:3000/api/submit-form'; // Replace with your backend URL

        try {
            // Make the fetch call
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            // Check if the request was successful
            if (!response.ok) {
                // Throw an error if the status code is not in the 200-299 range
                throw new Error(`Server responded with a ${response.status} status.`);
            }

            // Parse the JSON response
            const result = await response.json();
            console.log('Success:', result);
            alert('Form submitted successfully!');
            form.reset();
        } catch (error) {
            // Catch any network errors or the error we threw above
            console.error('Error submitting form:', error.message);
            alert('An error occurred during submission. Please try again.');
        }
    });
});
