import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import AuthContext from "@/context/auth-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useContext } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string(),
});

const Login = () => {
  const { loginUser, loginLoading } = useContext(AuthContext);
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    console.log(values);
    await loginUser(values);
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full min-h-[85vh] items-center justify-center"
      >
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Library Management System</CardTitle>
            <CardDescription>login to your account</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your Username" {...field} />
                  </FormControl>
                  <FormMessage className="text-start" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your secret password"
                      {...field}
                      type="password"
                    />
                  </FormControl>
                  <FormMessage className="text-start" />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex flex-col space-y-2">
            <Button type="submit" size="lg" className="w-full">
              {loginLoading ? <Loader className="animate-spin" /> : "Login"}
            </Button>
            <CardDescription>
              Don't have an account?{" "}
              <a href="/register" className="text-blue-500">
                Register
              </a>
            </CardDescription>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};

export default Login;
