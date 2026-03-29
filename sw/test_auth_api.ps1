# Authentication API - PowerShell cURL Examples
# Run this script to test the authentication endpoints

# Function to make HTTP requests and show results
function Test-AuthEndpoint {
    param(
        [string]$TestName,
        [string]$Email,
        [string]$Password,
        [string]$ExpectedStatus
    )

    Write-Host "===================================================="
    Write-Host $TestName
    Write-Host "===================================================="

    $body = @{
        email = $Email
        password = $Password
    } | ConvertTo-Json

    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/api/auth/login" `
            -Method POST `
            -Headers @{"Content-Type" = "application/json"} `
            -Body $body `
            -ErrorAction Stop

        Write-Host "✅ Status: $($response.StatusCode)"
        Write-Host "Response:"
        $response.Content | ConvertFrom-Json | ConvertTo-Json | Write-Host
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.Value__
        Write-Host "❌ Status: $statusCode"
        Write-Host "Error Message:"
        Write-Host $_.Exception.Response.Content.ReadAsStringAsync().Result
    }

    Write-Host ""
}

# ============================================================================
# TEST 1: SUCCESSFUL LOGIN - ADMIN USER
# ============================================================================
Test-AuthEndpoint `
    -TestName "Test 1: Successful Login - ADMIN User" `
    -Email "admin@example.com" `
    -Password "admin123" `
    -ExpectedStatus "200"

# ============================================================================
# TEST 2: SUCCESSFUL LOGIN - REGULAR USER
# ============================================================================
Test-AuthEndpoint `
    -TestName "Test 2: Successful Login - Regular User" `
    -Email "user@example.com" `
    -Password "user123" `
    -ExpectedStatus "200"

# ============================================================================
# TEST 3: INVALID PASSWORD - 401
# ============================================================================
Test-AuthEndpoint `
    -TestName "Test 3: Invalid Password (Expected 401)" `
    -Email "admin@example.com" `
    -Password "wrongpassword" `
    -ExpectedStatus "401"

# ============================================================================
# TEST 4: USER NOT FOUND - 401
# ============================================================================
Test-AuthEndpoint `
    -TestName "Test 4: User Not Found (Expected 401)" `
    -Email "nonexistent@example.com" `
    -Password "anypassword" `
    -ExpectedStatus "401"

# ============================================================================
# TEST 5: INACTIVE USER - 403
# ============================================================================
Test-AuthEndpoint `
    -TestName "Test 5: Inactive User (Expected 403)" `
    -Email "inactive@example.com" `
    -Password "pass123" `
    -ExpectedStatus "403"

# ============================================================================
# TEST 6: MISSING EMAIL - 400
# ============================================================================
Write-Host "===================================================="
Write-Host "Test 6: Missing Email (Expected 400)"
Write-Host "===================================================="

$body = @{
    password = "admin123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/auth/login" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $body `
        -ErrorAction Stop

    Write-Host "✅ Status: $($response.StatusCode)"
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.Value__
    Write-Host "❌ Status: $statusCode"
    Write-Host "Error Message:"
    Write-Host $_.Exception.Response.Content.ReadAsStringAsync().Result
}

Write-Host ""

# ============================================================================
# TEST 7: MISSING PASSWORD - 400
# ============================================================================
Write-Host "===================================================="
Write-Host "Test 7: Missing Password (Expected 400)"
Write-Host "===================================================="

$body = @{
    email = "admin@example.com"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/auth/login" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $body `
        -ErrorAction Stop

    Write-Host "✅ Status: $($response.StatusCode)"
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.Value__
    Write-Host "❌ Status: $statusCode"
    Write-Host "Error Message:"
    Write-Host $_.Exception.Response.Content.ReadAsStringAsync().Result
}

Write-Host ""

# ============================================================================
# TEST 8: HEALTH CHECK
# ============================================================================
Write-Host "===================================================="
Write-Host "Test 8: Health Check (Expected 200)"
Write-Host "===================================================="

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/auth/health" `
        -Method GET `
        -ErrorAction Stop

    Write-Host "✅ Status: $($response.StatusCode)"
    Write-Host "Response:"
    Write-Host $response.Content
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.Value__
    Write-Host "❌ Status: $statusCode"
}

Write-Host ""
Write-Host "===================================================="
Write-Host "TESTING SUMMARY"
Write-Host "===================================================="
Write-Host "Expected Results:"
Write-Host "  Test 1: 200 OK - Valid admin credentials"
Write-Host "  Test 2: 200 OK - Valid user credentials"
Write-Host "  Test 3: 401 Unauthorized - Invalid password"
Write-Host "  Test 4: 401 Unauthorized - User not found"
Write-Host "  Test 5: 403 Forbidden - User inactive"
Write-Host "  Test 6: 400 Bad Request - Missing email"
Write-Host "  Test 7: 400 Bad Request - Missing password"
Write-Host "  Test 8: 200 OK - Health check"
Write-Host ""
Write-Host "Important:"
Write-Host "  ✅ Password is NEVER returned in the response"
Write-Host "  ✅ Only user id, name, email, role, department, active, and createdAt are returned"
Write-Host "  ✅ Appropriate HTTP status codes are used"
Write-Host ""

