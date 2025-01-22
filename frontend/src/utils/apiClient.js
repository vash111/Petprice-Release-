import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:8080',
    withCredentials: true, // 쿠키 및 세션 포함
    headers: {
        'Content-Type': 'application/json',
    },
});

export const setupInterceptors = (navigate) => {
    apiClient.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response) {
                const { status, config } = error.response;
                const { url } = config;

                // 인증이 필요 없는 경로
                const noAuthPaths = [
                    '/',
                    '/animalsearch',
                    '/VolunteerSearchPage',
                    '/FreeBoardPage',
                    '/ReviewBoardPage',
                    '/AboutPage',
                    '/customersupport',
                    '/api/users/session',
                    '/api/public/notices',
                    '/notice-board',
                    '/notice-detail',
                    
                ];

                if (status === 401 && !noAuthPaths.some((path) => url.includes(path))) {
                    alert('인증이 필요합니다. 다시 로그인해주세요.');
                    navigate('/'); // 인증 실패 시 메인 페이지로 리다이렉트
                }
            }
            return Promise.reject(error);
        }
    );
};

export default apiClient;
