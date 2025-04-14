import React from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoginForm from "../login/LoginForm";
import RegisterForm from "../register/RegisterForm";

const AuthModal = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-red-700 hover:text-white rounded-md w-[100px]"
        >
          Sign In
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] p-0 overflow-hidden">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <div className="overflow-y-auto max-h-[calc(90vh-60px)]">
            <TabsContent value="login" className="m-0 p-6 focus:outline-none">
              <div className="bg-background">
                <LoginForm />
              </div>
            </TabsContent>
            <TabsContent
              value="register"
              className="m-0 p-6 focus:outline-none"
            >
              <div className="bg-background">
                <RegisterForm />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
