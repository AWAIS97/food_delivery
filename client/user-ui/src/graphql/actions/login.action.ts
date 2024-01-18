"use client";

import { gql, DocumentNode } from "@apollo/client";

export const LOGIN_USER: DocumentNode = gql`
  mutation LoginUser($email: String!, $password: String!) {
    Login(loginDto: { email: $email, password: $password }) {
      user {
        email
        name
      }
      error {
        message
      }
      accessToken
      refreshToken
    }
  }
`;
