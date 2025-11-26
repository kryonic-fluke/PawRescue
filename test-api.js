import fetch from 'node-fetch';

const testData = {
  animalType: "Dog",
  location: "Test Location",
  description: "Test report",
  phone: "9876543210",
  email: "test@example.com",
  urgency: "medium",
  status: "pending"
};

fetch('http://localhost:3001/api/rescue-reports-new', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData)
})
.then(response => response.json())
.then(data => {
  console.log('Success:', data);
})
.catch(error => {
  console.error('Error:', error);
});
