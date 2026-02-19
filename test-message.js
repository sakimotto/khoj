// Quick test to see what error occurs when sending messages
const testMessage = async () => {
    try {
        console.log('Testing message sending...');
        
        // Test with a simple message
        const response = await fetch('http://localhost:42110/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: "Hello, what is your name?",
                stream: false
            })
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log('Error response:', errorText);
            return;
        }
        
        const data = await response.json();
        console.log('Success response:', data);
        
    } catch (error) {
        console.log('Network error:', error.message);
        console.log('Full error:', error);
    }
};

testMessage();