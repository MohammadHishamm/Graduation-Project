class TestClass:
    # Class fields (attributes)
    count = None
    name = None
    balance = None
    is_active = None
    static_field = 0  # Static field, it will be shared across all instances

    # Constructor (initializer in Python)
    def __init__(self, count, name, balance):
        self.count = count
        self.name = name
        self.balance = balance

    # Method to update balance
    def update_balance(self, amount):
        self.balance += amount

    # Getter for 'count'
    @property
    def get_count(self):
        return self.count

    # Setter for 'count'
    @get_count.setter
    def set_count(self, count):
        self.count = count
