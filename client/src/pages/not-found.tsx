import React from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600 text-center">
            Sorry, the page you are looking for does not exist.
          </p>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-blue-500 underline">
              Go back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}