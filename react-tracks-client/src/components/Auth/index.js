import React, { useState } from "react";

import withRoot from "../../withRoot";
import Login from "./Login";
import Register from "./Register";

export default withRoot(() => {
  const [newUser, setNewUser] = useState(false);

  return newUser ? (
    <Register setNewUser={setNewUser} />
  ) : (
    <Login setNewUser={setNewUser} />
  );
});
