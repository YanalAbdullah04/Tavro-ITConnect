export function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function getAuthToken() {
  return localStorage.getItem('itConnectToken');
}

export function getUserId() {
  const token = getAuthToken();
  if (!token) return null;
  const decoded = parseJwt(token);
  return decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decoded?.nameid || decoded?.sub;
}

export function getUserRole() {
  const token = getAuthToken();
  if (!token) return null;
  const decoded = parseJwt(token);
  return decoded?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded?.role;
}

export function getAuthHeaders() {
  const token = getAuthToken();
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }
  return {
    'Content-Type': 'application/json'
  };
}
