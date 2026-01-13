import { api } from "./axios";
import APIConfig from "./config";

export const AuthApi = {
    login(data){
        const url = `${APIConfig.auth}/login`
        return api.post(url, data)
    },
    logout(data){
        const url = `${APIConfig.auth}/logout`
        return api.post(url, data)
    },
    register(data){
        const url = `${APIConfig.auth}/register`
        return api.post(url, data)
    },
    forgotPassword(data){
        const url = `${APIConfig.auth}/forgot-password`
        return api.post(url, data)
    },
    resetPassword(data){
        const url = `${APIConfig.auth}/reset-password`
        return api.post(url, data)
    },
    activeUser(data){
        const url = `${APIConfig.auth}/active`
        return api.post(url, data)
    },
    deactiveUser(data){
        const url = `${APIConfig.auth}/deactive`
        return api.post(url, data)
    },
    getAllUsers(data){
        const url = `${APIConfig.auth}/users`
        return api.get(url, data)
    },
    refreshToken(data){
        const url = `${APIConfig.auth}/refresh-token`
        return api.post(url, data)
    }
}

