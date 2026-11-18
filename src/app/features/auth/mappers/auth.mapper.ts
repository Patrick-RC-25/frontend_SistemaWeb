import { TokenApiResponse } from '../interfaces/login-api.interface';
import { AuthResponse } from '../interfaces/auth-response.interface';

export function toAuthResponse(response: TokenApiResponse): AuthResponse {
  return {
    authenticated: true,
    email: response.email,
    idUsuario: response.id_usuario,
    token: response.access_token,
  };
}
