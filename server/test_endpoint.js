import axios from 'axios';

async function test() {
  try {
    const res = await axios.post('http://localhost:3001/api/simulations/start-demo', {
      parameters: { hump_reduction: 50 },
      file_path: "/uploads/dummy4.png", // Ensure this exists from our previous test
      gender: "male",
      age: 30
    });
    console.log("Endpoint Result:", res.data);
  } catch (err) {
    console.error("Endpoint Error:", err?.response?.data || err.message);
  }
}

test();
