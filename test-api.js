// Simple test script to verify API endpoints
// Run with: npm run test-api
// Make sure to start the API server first with: npm run api

const testEndpoints = async () => {
  const baseUrl = 'http://localhost:3000' // API server runs on port 3000
  
  try {
    console.log('Testing /api/filters endpoint...')
    const filtersResponse = await fetch(`${baseUrl}/api/filters`)
    const filtersData = await filtersResponse.json()
    
    console.log('Filters endpoint response:')
    console.log('- Tags count:', filtersData.tags?.length || 0)
    console.log('- Institutions count:', filtersData.institutions?.length || 0)
    console.log('- Demands count:', filtersData.demands?.length || 0)
    console.log('Sample tags:', filtersData.tags?.slice(0, 5))
    
    console.log('\nTesting /api/projects endpoint...')
    const projectsResponse = await fetch(`${baseUrl}/api/projects`)
    const projectsData = await projectsResponse.json()
    
    console.log('Projects endpoint response:')
    console.log('- Projects count:', projectsData.length || 0)
    console.log('Sample project:', projectsData[0] ? {
      title: projectsData[0].title,
      tags: projectsData[0].allTags,
      home_studio: projectsData[0].home_studio?.title
    } : 'No projects found')
    
  } catch (error) {
    console.error('Error testing endpoints:', error.message)
    console.log('Make sure your API server is running with: npm run api')
    console.log('Then run this test with: npm run test-api')
  }
}

testEndpoints()
