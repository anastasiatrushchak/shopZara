from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time

def run_scraper():
    chrome_options = Options()
    # Вимикаємо зайвий шум у консолі
    chrome_options.add_experimental_option('excludeSwitches', ['enable-logging'])
    # chrome_options.add_argument("--headless") # Розкоментуй, якщо не хочеш бачити вікно

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    wait = WebDriverWait(driver, 10) # Максимальне очікування елементів - 10 сек

    try:
        print("--- Крок 1: Авторизація ---")
        driver.get("http://127.0.0.1:8000/admin/login/")
        
        # Чекаємо на поле логіну
        user_input = wait.until(EC.presence_of_element_located((By.NAME, "username")))
        user_input.send_keys("admin@example.com") # ПЕРЕВІР СВІЙ EMAIL
        driver.find_element(By.NAME, "password").send_keys("password123") # ПЕРЕВІР ПАРОЛЬ
        driver.find_element(By.XPATH, '//input[@type="submit"]').click()

        print("--- Крок 2: Перехід до продуктів ---")
        # Чекаємо завантаження головної сторінки адмінки і переходимо до продуктів
        wait.until(EC.presence_of_element_located((By.ID, "content-main")))
        driver.get("http://127.0.0.1:8000/admin/core/product/")

        print("--- Крок 3: Зчитування даних ---")
        # Чекаємо, поки з'явиться таблиця з результатами
        wait.until(EC.presence_of_element_located((By.ID, "result_list")))
        
        # В Django Admin назви зазвичай знаходяться в тегах <th> або <td> з класом field-name
        products = driver.find_elements(By.CSS_SELECTOR, "#result_list tbody th.field-name a")
        
        if not products:
            # Спроба №2, якщо назва не є посиланням
            products = driver.find_elements(By.CLASS_NAME, "field-name")

        print(f"\nЗнайдено товарів: {len(products)}")
        for i, p in enumerate(products, 1):
            print(f"{i}. {p.text}")

    except Exception as e:
        print(f"\n[!] Виникла помилка: {e}")
    finally:
        time.sleep(3) # Даємо час подивитись на результат перед закриттям
        driver.quit()
        print("\n--- Роботу завершено ---")

if __name__ == "__main__":
    run_scraper()