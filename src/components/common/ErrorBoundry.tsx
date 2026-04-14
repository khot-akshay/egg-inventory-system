// components/ErrorBoundary.js
import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Error caught in ErrorBoundary: ", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div>
                    <h1>Oops! Something went wrong.</h1>
                    <p>We apologize for the inconvenience. Our dedicated developers are working tirelessly to bring you the best experience. Thank you for your patience and understanding!</p>
                    <p>Please try again later, or feel free to reach out to our <a href="/" target='blank' style={{ color: '#1976d2' }}>support team</a> for assistance.</p>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
