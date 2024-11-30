// // Base class with protected methods and fields
// public class BaseClass {

//     // Protected field
//     protected int protectedField;

//     // Constructor to initialize protectedField
//     public BaseClass(int value) {
//         this.protectedField = value;
//     }

//     // Protected method
//     protected void displayField() {
//         System.out.println("Protected field value: " + protectedField);
//     }

//     // Another protected method
//     protected void increaseField(int value) {
//         this.protectedField += value;
//         System.out.println("Protected field value after increase: " + protectedField);
//     }
// }

// // Derived class that inherits from BaseClass
// public class DerivedClass extends BaseClass {

//     // Constructor to initialize the BaseClass constructor
//     public DerivedClass(int value) {
//         super(value);  // Calling the parent constructor to initialize protectedField
//     }

//     // Method that calls the protected method from BaseClass
//     public void modifyAndDisplayField(int increment) {
//         increaseField(increment);  // Calling the protected method
//         displayField();            // Calling the protected method
//     }
// }

// // Main class to run the code
// public class Test {

//     public static void main(String[] args) {
//         // Create an object of DerivedClass
//         DerivedClass obj = new DerivedClass(10);
        
//         // Call method in DerivedClass that uses protected methods from BaseClass
//         obj.modifyAndDisplayField(5);
//     }
// }
