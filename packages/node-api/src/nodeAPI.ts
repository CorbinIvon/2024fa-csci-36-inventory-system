const nodeAPI = {
  async fetch() {
    const query = `
      query getAllNodes {
        nodes {
          id
          name
          description
          parentNodeID
          children {
            id
            name
            description
          }
        }
      }
    `

    const endpoint = process.env.GRAPHQL_ENDPOINT
    if (!endpoint) {
      throw new Error(
        'The variable `GRAPHQL_ENDPOINT` is not defined in the environment variables. Please reference the .env.example file.',
      )
    }
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        variables: {},
      }),
    })

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    const json = await response.json()
    return json
  },
}

export default nodeAPI
