from app import create_app, db
from app.models import Problem, TestCase, Room

# Create a Flask app instance to work with the database
app = create_app()

def seed_problems():
    # FizzBuzz
    fizzbuzz = Problem()
    fizzbuzz.title = "FizzBuzz"
    fizzbuzz.description = "Write a program that prints the numbers from 1 to 100. But for multiples of three print 'Fizz' instead of the number and for the multiples of five print 'Buzz'. For numbers which are multiples of both three and five print 'FizzBuzz'."
    fizzbuzz_testcases = []
    tc = TestCase(); tc.input_data = "15"; tc.expected_output = "1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz"; fizzbuzz_testcases.append(tc)
    tc = TestCase(); tc.input_data = "5"; tc.expected_output = "1 2 Fizz 4 Buzz"; fizzbuzz_testcases.append(tc)
    fizzbuzz.test_cases.extend(fizzbuzz_testcases)

    # Palindrome Number
    palindrome = Problem()
    palindrome.title = "Palindrome Number"
    palindrome.description = "Determine whether an integer is a palindrome. An integer is a palindrome when it reads the same backward as forward."
    palindrome_testcases = []
    tc = TestCase(); tc.input_data = "121"; tc.expected_output = "True"; palindrome_testcases.append(tc)
    tc = TestCase(); tc.input_data = "-121"; tc.expected_output = "False"; palindrome_testcases.append(tc)
    tc = TestCase(); tc.input_data = "10"; tc.expected_output = "False"; palindrome_testcases.append(tc)
    palindrome.test_cases.extend(palindrome_testcases)

    # Maximum Subarray
    max_subarray = Problem()
    max_subarray.title = "Maximum Subarray"
    max_subarray.description = "Find the contiguous subarray which has the largest sum and return its sum."
    max_subarray_testcases = []
    tc = TestCase(); tc.input_data = "-2 1 -3 4 -1 2 1 -5 4"; tc.expected_output = "6"; max_subarray_testcases.append(tc)
    tc = TestCase(); tc.input_data = "1"; tc.expected_output = "1"; max_subarray_testcases.append(tc)
    tc = TestCase(); tc.input_data = "5 4 -1 7 8"; tc.expected_output = "23"; max_subarray_testcases.append(tc)
    max_subarray.test_cases.extend(max_subarray_testcases)

    # Two Sum
    two_sum = Problem()
    two_sum.title = "Two Sum"
    two_sum.description = "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target."
    two_sum_testcases = []
    tc = TestCase(); tc.input_data = "2 7 11 15\n9"; tc.expected_output = "0 1"; two_sum_testcases.append(tc)
    tc = TestCase(); tc.input_data = "3 2 4\n6"; tc.expected_output = "1 2"; two_sum_testcases.append(tc)
    tc = TestCase(); tc.input_data = "3 3\n6"; tc.expected_output = "0 1"; two_sum_testcases.append(tc)
    two_sum.test_cases.extend(two_sum_testcases)

    # Reverse Linked List
    reverse_ll = Problem()
    reverse_ll.title = "Reverse Linked List"
    reverse_ll.description = "Reverse a singly linked list."
    reverse_ll_testcases = []
    tc = TestCase(); tc.input_data = "1 2 3 4 5"; tc.expected_output = "5 4 3 2 1"; reverse_ll_testcases.append(tc)
    tc = TestCase(); tc.input_data = "1 2"; tc.expected_output = "2 1"; reverse_ll_testcases.append(tc)
    tc = TestCase(); tc.input_data = ""; tc.expected_output = ""; reverse_ll_testcases.append(tc)
    reverse_ll.test_cases.extend(reverse_ll_testcases)

    db.session.add_all([fizzbuzz, palindrome, max_subarray, two_sum, reverse_ll])
    db.session.commit()

if __name__ == "__main__":
    with app.app_context():
        seed_problems()
        print("Problems seeded!")