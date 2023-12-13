import supabase from "./supabase";

export async function getUserByEmail({ email }: { email: string }) {
  console.log(email);
  try {
    // get user using email from the users table

    // Check if email is provided
    if (!email) {
      throw new Error("Email is required");
    }

    // Query the users table based on the email
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();
    // Check for errors
    if (error) {
      throw new Error(`Error getting User by Email: ${error.message}`);
    }

    if (!data) {
      throw new Error(`No User found`);
    }

    // Return the user data
    return { id: data.id, email: data.email, role: data.role };
  } catch (error: any) {
    throw new Error(`Error getting User by Email: ${error.message}`);
  }
}

export async function authUser({ email }: { email: string }) {
  try {
    // Get user by email
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    // Check for errors
    if (error) {
      throw new Error(`Error getting User by Email: ${error.message}`);
    }

    // If the user is not found, return null
    if (!user) {
      return null;
    }

    return user;
  } catch (error: any) {
    throw new Error(`Error authenticating user: ${error.message}`);
  }
}
