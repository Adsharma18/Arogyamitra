import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import AromiChatbot from '../chat/AromiChatbot';

const ProtectedRoute = () => {
    const { isAuthenticated } = useAuthStore();
    const location = useLocation();

    if (!isAuthenticated) {
        // Redirect them to the /login page, but save the current location they were trying to go to
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />
            <div className="flex pt-16 h-screen overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto w-full md:pl-64">
                    {/* Outlet renders the child routes wrapped by ProtectedRoute */}
                    <div className="p-6 pb-24 max-w-7xl mx-auto w-full">
                        <Outlet />
                    </div>
                </main>
            </div>
            {/* Global floating Chatbot accessible on all protected routes */}
            <AromiChatbot />
        </div>
    );
};

export default ProtectedRoute;
