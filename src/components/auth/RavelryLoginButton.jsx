const RAVELRY_LOGIN_URL = `${import.meta.env.VITE_API_URL}/auth/ravelry/login`;

function RavelryLoginButton() {
  return (
    <a
      href={RAVELRY_LOGIN_URL}
      className="btn btn-outline-secondary-custom w-100"
    >
      Continue with Ravelry
    </a>
  );
}

export default RavelryLoginButton;
