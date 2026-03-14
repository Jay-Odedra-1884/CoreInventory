// import "./globals.css";
// import { DM_Sans } from "next/font/google";
// const dmSans = DM_Sans({ subsets: ["latin"] });
// export default function RootLayout({ children }) {
//   return (
//     <html>
//       <body className={dmSans.className}>{children}</body>
//     </html>
//   );
// }
import { AppProvider } from "@/context/AppContext";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata = {
  title: "CoreInventory",
  description: "Inventory Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <Toaster position="top-right" />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}