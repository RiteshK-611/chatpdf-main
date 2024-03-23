# ChatPDF Clone

![image](https://github.com/RiteshK-611/chatpdf-main/assets/61982298/8acab08f-8041-4b01-969c-9f0d7fb2397f)


## Technologies and Frameworks

- Next.js 14.1 (App Router)
- React
- TypeScript
- <b>Database</b>
  - Drizzle ORM
  - Neon Database
  - PostgreSQL
- <b>AI-related</b>
  - Pinecone (Vector Database)
  - Langchain
  - Google Gemini
  - Vercel AI SDK
- <b>User Authentication</b>: Clerk
- <b>Object Storage</b>: AWS SDK
- <b>Payment</b>: Stripe SDK
- <b>Styling</b>: Tailwind CSS
- <b>Third-Party UI Components</b>
  - React Dropzone
  - React Hot Toast
  - shadcn-ui
  - Lucide icons

</br>

# Installation

Follow the steps below to install and setup the project:

1. **Clone the repository**

   Open your terminal and run the following command:

   ```bash
   git clone https://github.com/RiteshK-611/chatpdf-main.git
   ```

2. **Navigate to the project directory**

   ```bash
   cd chatpdf-main
   ```

3. **Install Node.js**

   The project requires Node.js version 19.9.0 or later. You can download it from [here](https://nodejs.org/en/download/).

4. **Install the required dependencies**

   Run the following command to install all the required dependencies:

   ```bash
   npm install
   ```

   This will install all the dependencies listed in the `package.json` file, including Next.js, React, React DOM, Axios, Stripe, Tailwind CSS, and other specific dependencies such as "@aws-sdk/client-s3" and "@clerk/nextjs".

5. **Setup environment variables**

    Create a `.env` file in the root directory of your project and add the required environment variables.

6. **Run the project**

    Now, you can run the project using the following command:

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
