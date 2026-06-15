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

    console.log('--- Fetching trainers to get Trainer ID...');
    const trainersRes = await fetch(`${baseUrl}/api/Trainer`, {
      headers: authHeaders
    });
    const trainersData = await trainersRes.json();
    const trainerId = trainersData.items[0].userId;
    console.log('Using Trainer ID:', trainerId);

    console.log('--- Creating a track...');
    const trackRes = await fetch(`${baseUrl}/api/Track`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Debug Track',
        description: 'Track for debugging updates'
      })
    });
    console.log('Create Track status:', trackRes.status);

    console.log('--- Getting tracks to find the ID...');
    const tracksRes = await fetch(`${baseUrl}/api/Track`, {
      headers: authHeaders
    });
    const tracks = await tracksRes.json();
    const trackId = tracks[0].id;
    console.log('Using Track ID:', trackId);

    console.log('--- Creating training session...');
    const sessionRes = await fetch(`${baseUrl}/api/TrainingSession`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Debug Training Session',
        description: 'Session for debugging updates',
        isPaid: false,
        location: 'Online',
        startDate: '2026-06-20T00:00:00.000Z',
        endDate: '2026-09-20T00:00:00.000Z',
        seatsNumber: 20,
        trackId: trackId,
        trainerId: trainerId
      })
    });
    console.log('Create Training Session status:', sessionRes.status);

    console.log('--- Getting training sessions...');
    const sessionsRes = await fetch(`${baseUrl}/api/TrainingSession`, {
      headers: authHeaders
    });
    const sessions = await sessionsRes.json();
    const sessionId = sessions[0].id;
    console.log('Using Session ID:', sessionId);

    console.log('--- Creating post...');
    const postRes = await fetch(`${baseUrl}/api/Post`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Debug Opportunity',
        description: 'Opportunity description',
        deadline: '2026-07-20T00:00:00.000Z',
        reqSkills: 'C#',
        responsibility: 'Debug',
        benefits: 'None',
        status: 'Pending',
        trainingSessionId: sessionId
      })
    });
    console.log('Create Post status:', postRes.status);

    console.log('--- Getting posts...');
    const postsRes = await fetch(`${baseUrl}/api/Post`, {
      headers: authHeaders
    });
    const posts = await postsRes.json();
    const post = posts[0];
    console.log('Using Post ID:', post.id);

    console.log('--- Updating post (PUT)...');
    const updateRes = await fetch(`${baseUrl}/api/Post`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        id: post.id,
        title: 'Debug Opportunity Updated',
        description: 'Opportunity description updated',
        deadline: '2026-07-20T00:00:00.000Z',
        reqSkills: 'C#, Node',
        responsibility: 'Debug all the things',
        benefits: 'Learning and growth',
        status: 'Pending',
        trainingSessionId: sessionId
      })
    });
    console.log('Update Post status:', updateRes.status);
    const updateText = await updateRes.text();
    console.log('Update Post response:', updateText);

  } catch (error) {
    console.error('Error in script:', error);
  }
}

run();
