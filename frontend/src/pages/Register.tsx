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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
});

const Register = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Form submitted:", values);
    // Add your login logic here (e.g., API call)
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
            <CardDescription>Register a new account</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" {...field} />
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

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Confirm your secret password"
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
              Register
            </Button>
            <CardDescription>
              Already have an account?{" "}
              <a href="/" className="text-blue-500">
                Login
              </a>
            </CardDescription>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};

export default Register;
