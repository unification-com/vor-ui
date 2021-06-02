import { GUESTTOKEN } from "./Constants"

// Service to check authentication for user and to signOut
const Auth = {
  signOut() {
    localStorage.removeItem("token")
  },
  isGuest() {
    if (this.isAuth() == GUESTTOKEN) return true
  },
  loginGuest() {
    this.setAuth(GUESTTOKEN)
  },
  isAuth() {
    return localStorage.getItem("token")
  },
  setAuth(token) {
    localStorage.setItem("token", token)
  },
}
export default Auth
