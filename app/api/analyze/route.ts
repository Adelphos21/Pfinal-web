import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { parser, grammar, tokens = [], action } = body

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
    const endpoint = action === "build" ? "/visualization/build" : "/visualization/parse"

    const payload: Record<string, unknown> = {
      parser,
      grammar,
    }

    if (action === "parse") {
      payload.tokens = Array.isArray(tokens) ? tokens : []
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    //
    // backend error
    //

    if (!response.ok) {

      const error = await response.json()

      return NextResponse.json(
        error,
        {
          status: response.status
        }
      )
    }

    //
    // success
    //

    const data = await response.json()

    return NextResponse.json(
      data
    )

  } catch (error) {

    console.error(
      "API Error:",
      error
    )

    return NextResponse.json(
      {
        detail:
          "Error procesando la solicitud"
      },
      {
        status: 500
      }
    )
  }
}