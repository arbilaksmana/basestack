// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title SubscriptionManager
 * @dev Manages recurring subscription payments for BaseStack
 */
contract SubscriptionManager is Ownable, ReentrancyGuard {
    
    struct Plan {
        address merchant;
        uint256 priceIdrx;
        uint256 priceUsdc;
        uint256 priceUsdt;
        uint256 billingInterval; // in seconds
        bool active;
    }
    
    struct Subscription {
        uint256 planId;
        address token;
        uint256 amount;
        uint256 nextPayment;
        bool active;
    }
    
    // Supported tokens
    IERC20 public idrxToken;
    IERC20 public usdcToken;
    IERC20 public usdtToken;
    
    // Storage
    mapping(uint256 => Plan) public plans;
    mapping(address => mapping(uint256 => Subscription)) public subscriptions;
    uint256 public planCount;
    
    // Keeper address (can charge subscriptions)
    address public keeper;
    
    // Events
    event PlanCreated(uint256 indexed planId, address indexed merchant);
    event Subscribed(address indexed user, uint256 indexed planId, address token, uint256 amount);
    event SubscriptionCharged(address indexed user, uint256 indexed planId, uint256 amount);
    event SubscriptionCanceled(address indexed user, uint256 indexed planId);
    event KeeperUpdated(address indexed newKeeper);
    
    constructor(
        address _idrx,
        address _usdc,
        address _usdt,
        address _keeper
    ) {
        idrxToken = IERC20(_idrx);
        usdcToken = IERC20(_usdc);
        usdtToken = IERC20(_usdt);
        keeper = _keeper;
    }
    
    modifier onlyKeeper() {
        require(msg.sender == keeper || msg.sender == owner(), "Not authorized");
        _;
    }
    
    function createPlan(
        uint256 _priceIdrx,
        uint256 _priceUsdc,
        uint256 _priceUsdt,
        uint256 _billingInterval
    ) external returns (uint256) {
        require(_billingInterval >= 1 days, "Interval too short");
        
        planCount++;
        plans[planCount] = Plan({
            merchant: msg.sender,
            priceIdrx: _priceIdrx,
            priceUsdc: _priceUsdc,
            priceUsdt: _priceUsdt,
            billingInterval: _billingInterval,
            active: true
        });
        
        emit PlanCreated(planCount, msg.sender);
        return planCount;
    }
    
    function subscribe(uint256 _planId, address _token) external nonReentrant {
        Plan storage plan = plans[_planId];
        require(plan.active, "Plan not active");
        require(!subscriptions[msg.sender][_planId].active, "Already subscribed");
        
        uint256 amount = _getPrice(plan, _token);
        require(amount > 0, "Invalid token");
        
        IERC20 token = _getTokenContract(_token);
        require(token.transferFrom(msg.sender, plan.merchant, amount), "Transfer failed");
        
        subscriptions[msg.sender][_planId] = Subscription({
            planId: _planId,
            token: _token,
            amount: amount,
            nextPayment: block.timestamp + plan.billingInterval,
            active: true
        });
        
        emit Subscribed(msg.sender, _planId, _token, amount);
    }
    
    function chargeSubscription(address _user, uint256 _planId) external onlyKeeper nonReentrant returns (bool) {
        Subscription storage sub = subscriptions[_user][_planId];
        Plan storage plan = plans[_planId];
        
        require(sub.active, "Subscription not active");
        require(block.timestamp >= sub.nextPayment, "Not due yet");
        
        IERC20 token = _getTokenContract(sub.token);
        bool success = token.transferFrom(_user, plan.merchant, sub.amount);
        
        if (success) {
            sub.nextPayment = block.timestamp + plan.billingInterval;
            emit SubscriptionCharged(_user, _planId, sub.amount);
        }
        
        return success;
    }
    
    function cancelSubscription(uint256 _planId) external {
        Subscription storage sub = subscriptions[msg.sender][_planId];
        require(sub.active, "Not subscribed");
        sub.active = false;
        emit SubscriptionCanceled(msg.sender, _planId);
    }
    
    function setKeeper(address _keeper) external onlyOwner {
        keeper = _keeper;
        emit KeeperUpdated(_keeper);
    }
    
    function deactivatePlan(uint256 _planId) external {
        require(plans[_planId].merchant == msg.sender, "Not plan owner");
        plans[_planId].active = false;
    }
    
    function _getPrice(Plan storage plan, address _token) internal view returns (uint256) {
        if (_token == address(idrxToken)) return plan.priceIdrx;
        if (_token == address(usdcToken)) return plan.priceUsdc;
        if (_token == address(usdtToken)) return plan.priceUsdt;
        return 0;
    }
    
    function _getTokenContract(address _token) internal view returns (IERC20) {
        if (_token == address(idrxToken)) return idrxToken;
        if (_token == address(usdcToken)) return usdcToken;
        if (_token == address(usdtToken)) return usdtToken;
        revert("Invalid token");
    }
    
    function getSubscription(address _user, uint256 _planId) external view returns (Subscription memory) {
        return subscriptions[_user][_planId];
    }
    
    function getPlan(uint256 _planId) external view returns (Plan memory) {
        return plans[_planId];
    }
}
