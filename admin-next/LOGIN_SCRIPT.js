// 🔐 CONSOLE LOGIN SCRIPT - Copy & Paste in Browser Console (F12)

(async () => {
  console.log('🔐 Starting admin login...');
  
  try {
    const response = await fetch('http://localhost:3101/api/v1/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'admin@localhost', 
        password: 'admin123' 
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('admin_token', data.data.token);
      localStorage.setItem('admin_user', JSON.stringify(data.data.user));
      
      console.log('✅ LOGIN SUCCESS!');
      console.log('👤 User:', data.data.user);
      console.log('🔑 Token saved to localStorage');
      console.log('');
      console.log('🎯 Redirecting to products...');
      
      // Redirect naar products page
      setTimeout(() => {
        window.location.href = '/dashboard/products';
      }, 1000);
    } else {
      console.error('❌ LOGIN FAILED:', data);
    }
  } catch (error) {
    console.error('❌ NETWORK ERROR:', error);
  }
})();




