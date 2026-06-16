const baseUrl = 'http://localhost:5231';
const email = `debug_company_${Date.now()}@gmail.com`;
const password = 'Password123!';

async function run() {
  try {
    console.log('--- Registering company...');
    const registerRes = await fetch(`${baseUrl}/api/Account/Register/Company`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Debug Company',
        email,
        phone: '0599000000',
        password
      })
    });
    console.log('Register status:', registerRes.status);
    const registerData = await registerRes.json();

    console.log('--- Logging in...');
    const loginRes = await fetch(`${baseUrl}/api/Account/Login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const loginData = await loginRes.json();

    const token = loginData.token;
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    console.log('--- Registering a trainer for this company...');
    const registerTrainerRes = await fetch(`${baseUrl}/api/Account/Register/Trainer`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        fullName: 'Debug Trainer',
        email: `debug_trainer_${Date.now()}@gmail.com`,
        phone: '0599111222',
        specialization: 'Debugging'
      })
    });
    console.log('Register Trainer status:', registerTrainerRes.status);
    const registerTrainerData = await registerTrainerRes.json();
    console.log('Register Trainer response:', registerTrainerData);

    const trainerToken = registerTrainerData.token;
    const trainerAuthHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${trainerToken}`
    };

    console.log('--- Submitting Trainer Profile Completion (1st time)...');
    const completeRes1 = await fetch(`${baseUrl}/api/Account/Trainer/profile-setting`, {
      method: 'POST',
      headers: trainerAuthHeaders,
      body: JSON.stringify({
        password: 'NewTrainerPassword123!',
        gitHubAccount: 'debug-trainer-github'
      })
    });
    console.log('Completion 1 status:', completeRes1.status);
    const completeText1 = await completeRes1.text();
    console.log('Completion 1 response:', completeText1);

    console.log('--- Submitting Trainer Profile Completion (2nd time)...');
    const completeRes2 = await fetch(`${baseUrl}/api/Account/Trainer/profile-setting`, {
      method: 'POST',
      headers: trainerAuthHeaders,
      body: JSON.stringify({
        password: 'NewTrainerPassword123!',
        gitHubAccount: 'debug-trainer-github'
      })
    });
    console.log('Completion 2 status:', completeRes2.status);
    const completeText2 = await completeRes2.text();
    console.log('Completion 2 response:', completeText2);

  } catch (error) {
    console.error('Error in script:', error);
  }
}

run();
