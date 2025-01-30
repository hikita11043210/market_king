from django.urls import path, include
from rest_framework.authtoken import views as token_views
from .views.user import UserListCreateAPIView, UserDetailAPIView
from .views.setting import SettingAPIView
from .views.product_data import ProductDataAPIView
from .views.scraping import YahooAuctionItemSearchView, YahooAuctionCategorySearchView
from .views.shipping_calculator import ShippingCalculatorView

urlpatterns = [
    path('token/', token_views.obtain_auth_token),  # ログイン用エンドポイント
    path('users/', UserListCreateAPIView.as_view(), name='user-list-create'),
    path('users/<int:pk>/', UserDetailAPIView.as_view(), name='user-detail'),
    path('setting/', SettingAPIView.as_view(), name='setting'),
    path('product-register/', ProductDataAPIView.as_view(), name='product-register'),
    path('search/yahoo-auction/items/', YahooAuctionItemSearchView.as_view(), name='yahoo-auction-item-search'),
    path('search/yahoo-auction/categories/', YahooAuctionCategorySearchView.as_view(), name='yahoo-auction-category-search'),
    path('shipping-calculator/', ShippingCalculatorView.as_view(), name='shipping-calculator'),
] 