"use client";

import { gql, DocumentNode } from "@apollo/client";

export const LOGIN_USER: DocumentNode = gql`
  mutation LoginUser($email: String!, $password: String!) {
    login(LoginDto: { email: $email, password: $password }) {
      activation_token
      refresh_token
    }
  }
`;
