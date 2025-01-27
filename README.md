# AttyxAI Project

AttyxAI is a project that provides a platform for various AI-powered tools and features. It includes a task management system, a chat interface, and other functionalities to enhance productivity and collaboration.

## Key Features and Functionality

- **Task Management:** Users can create, organize, and manage tasks using different views such as board and list views.
- **Chat Interface:** A chat interface allows users to communicate and collaborate within the platform.
- **Authentication:** Secure user authentication with login, sign-in, and sign-up functionalities.
- **Pipeline View:** A pipeline view to visualize and manage workflows.
- **Reporting View:** A reporting view to analyze and track progress.

## Architecture and Technical Stack

The project is built using the following technologies:

- **Frontend:** React, Next.js, TypeScript, Tailwind CSS
- **State Management:** Zustand
- **UI Components:** Lucide React, Framer Motion, React Beautiful DnD
- **Backend:** Supabase

## Installation

1. Clone the repository.
2. Install dependencies using `npm install`.
3. Configure environment variables (if needed).
4. Run the development server using `npm run dev`.

## Usage

- Open the application in your browser.
- Use the navigation dock to access different views.
- Create and manage tasks using the task dashboard.
- Communicate with other users using the chat interface.

## Configuration

The project uses environment variables for configuration. Please refer to the `.env` file for available options.

## Deployment

The project can be deployed using various platforms such as Vercel or Netlify. Please refer to the documentation of your chosen platform for deployment instructions.

## Contribution Process

1. Fork the repository.
2. Create a new branch for your changes.
3. Make your changes and commit them.
4. Submit a pull request.

## Testing Procedures

The project includes unit and integration tests. Please refer to the `test` directory for more information.

## Known Issues

- There are some TODO comments in the codebase that need to be addressed.
- Some components may not be fully responsive on all devices.

## Dependencies

- "@supabase/supabase-js": "^2.48.1"
- "@types/react-beautiful-dnd": "^13.1.8"
- "date-fns": "^4.1.0"
- "framer-motion": "^12.0.5"
- "lucide-react": "^0.474.0"
- "next": "^14.2.23"
- "react": "^18.2.0"
- "react-beautiful-dnd": "^13.1.1"
- "react-dom": "^18.2.0"
- "tailwindcss-animate": "^1.0.7"
- "uuid": "^11.0.5"
- "zustand": "4.4.7"

## Recent Changes

- Initial commit with basic project structure and features.
- Added task management functionality.
- Implemented chat interface.
- Added authentication components.
- Created pipeline and reporting views.